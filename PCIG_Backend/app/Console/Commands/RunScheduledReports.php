<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ScheduledReport;
use App\Models\Report;
use App\Services\ReportGenerator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class RunScheduledReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:run-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run scheduled reports that are due';

    protected $reportGenerator;

    public function __construct(ReportGenerator $reportGenerator)
    {
        parent::__construct();
        $this->reportGenerator = $reportGenerator;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for scheduled reports...');

        $scheduledReports = ScheduledReport::where('next_run_at', '<=', now())->get();

        if ($scheduledReports->isEmpty()) {
            $this->info('No reports due.');
            return;
        }

        foreach ($scheduledReports as $scheduled) {
            $this->info("Running report ID: {$scheduled->id} (Type: {$scheduled->type})");

            try {
                $user = User::find($scheduled->user_id);

                if (!$user) {
                    $this->error("User not found for report {$scheduled->id}");
                    continue;
                }

                $report = $this->reportGenerator->generate(
                    $scheduled->type,
                    $scheduled->parameters ?? [],
                    $scheduled->user_id
                );

                // Mock Email Sending
                if (!empty($scheduled->recipients)) {
                    $this->info("Sending email to: " . implode(', ', $scheduled->recipients));
                    // Mail::to($scheduled->recipients)->send(new ReportGenerated($report));
                }

                // Update Next Run
                $nextRun = $scheduled->next_run_at->copy();
                switch ($scheduled->frequency) {
                    case 'daily': $nextRun->addDay(); break;
                    case 'weekly': $nextRun->addWeek(); break;
                    case 'monthly': $nextRun->addMonth(); break;
                }
                $scheduled->update(['next_run_at' => $nextRun]);

                $this->info("Report {$scheduled->id} generated and rescheduled for {$nextRun}");

            } catch (\Exception $e) {
                $this->error("Failed to generate report {$scheduled->id}: " . $e->getMessage());
                Log::error("Scheduled report failure: " . $e->getMessage());
            }
        }
    }
}
