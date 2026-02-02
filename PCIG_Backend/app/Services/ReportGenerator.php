<?php

namespace App\Services;

use App\Models\Property;
use App\Models\User;
use App\Models\Task;
use App\Models\Expense;
use App\Models\Depreciation;
use Illuminate\Support\Facades\Storage;
use App\Models\Report;

class ReportGenerator
{
    public function generate(string $type, array $parameters = [], int $userId): Report
    {
        $fileName = $type . '_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $filePath = 'reports/' . $fileName;

        $headers = [];
        $data = [];

        switch ($type) {
            case 'property_performance':
                $headers = ['Property ID', 'Address', 'City', 'State', 'Purchase Price', 'Current Value', 'ROI %', 'Status'];
                $query = Property::query();
                if (!empty($parameters['propertyId'])) {
                    $query->where('id', $parameters['propertyId']);
                }
                // Handle date range if applicable for performance metrics (not applicable to static property data, but maybe for related data)
                
                $properties = $query->get();
                foreach ($properties as $prop) {
                    $data[] = [
                        $prop->id,
                        $prop->address,
                        $prop->city,
                        $prop->state,
                        $prop->purchase_price,
                        $prop->current_value,
                        $prop->roi,
                        $prop->status
                    ];
                }
                break;

            case 'financial_summary':
                $headers = ['Metric', 'Value'];
                $totalInvestment = Property::sum('purchase_price');
                $totalValue = Property::sum('current_value');
                $data[] = ['Total Investment', number_format($totalInvestment, 2)];
                $data[] = ['Total Asset Value', number_format($totalValue, 2)];
                $data[] = ['Net Appreciation', number_format($totalValue - $totalInvestment, 2)];
                $data[] = ['Active Properties', Property::whereNotIn('status', ['sold', 'closed'])->count()];
                break;

            case 'investor_activity':
                $headers = ['User ID', 'Name', 'Email', 'Role', 'Joined Date', 'Total Distributions'];
                $users = User::with('distributions')->get();
                foreach ($users as $user) {
                    $totalDistributions = $user->distributions->sum('amount');
                    $data[] = [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->role ?? 'N/A',
                        $user->created_at->format('Y-m-d'),
                        number_format($totalDistributions, 2)
                    ];
                }
                break;

            case 'workflow_efficiency':
                $headers = ['Task ID', 'Title', 'Status', 'Assigned To', 'Created At', 'Completed At', 'Duration (Days)'];
                $query = Task::query();
                if (!empty($parameters['startDate'])) {
                    $query->whereDate('created_at', '>=', $parameters['startDate']);
                }
                if (!empty($parameters['endDate'])) {
                    $query->whereDate('created_at', '<=', $parameters['endDate']);
                }
                
                $tasks = $query->get();
                foreach ($tasks as $task) {
                    $completedAt = ($task->status === 'completed') ? $task->updated_at : null;
                    $duration = '';
                    if ($completedAt && $task->created_at) {
                        $duration = $task->created_at->diffInDays($completedAt);
                    }
                    $data[] = [
                        $task->id,
                        $task->title,
                        $task->status,
                        $task->assignedUser->name ?? 'Unassigned',
                        $task->created_at->format('Y-m-d H:i'),
                        $completedAt ? $completedAt->format('Y-m-d H:i') : 'Pending',
                        $duration
                    ];
                }
                break;

            case 'tax_report':
                $headers = ['Type', 'Category', 'Description', 'Amount', 'Date'];
                
                // Expenses
                $expQuery = Expense::query();
                if (!empty($parameters['startDate'])) $expQuery->whereDate('date', '>=', $parameters['startDate']);
                if (!empty($parameters['endDate'])) $expQuery->whereDate('date', '<=', $parameters['endDate']);
                
                $expenses = $expQuery->get();
                foreach ($expenses as $expense) {
                    $data[] = [
                        'Expense',
                        $expense->category ?? 'General',
                        $expense->description,
                        $expense->amount,
                        $expense->date ? $expense->date->format('Y-m-d') : $expense->created_at->format('Y-m-d')
                    ];
                }

                // Depreciations
                $depreciations = Depreciation::with('property')->get();
                foreach ($depreciations as $dep) {
                    $propAddress = $dep->property ? $dep->property->address : 'Unknown Property';
                    $data[] = [
                        'Depreciation',
                        $dep->method ?? 'Standard',
                        "Depreciation for $propAddress (Year: {$dep->tax_year})",
                        $dep->depreciation_amount,
                        $dep->created_at->format('Y-m-d')
                    ];
                }
                break;
            
            default:
                 $headers = ['Message'];
                 $data[] = ['Report type not implemented yet'];
                 break;
        }

        // Generate CSV content
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        foreach ($data as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        // Store file
        Storage::put($filePath, $content);

        return Report::create([
            'type' => $type,
            'parameters' => $parameters,
            'file_path' => $filePath,
            'generated_by' => $userId,
            'generated_at' => now(),
        ]);
    }
}
