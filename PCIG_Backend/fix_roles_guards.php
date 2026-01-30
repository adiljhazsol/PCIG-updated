$user = App\Models\User::where('email', 'admin@pcig.com')->first();
$roleWeb = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
$roleSanctum = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
$roleApi = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);

// Assign all to be safe
try { $user->assignRole($roleWeb); } catch (\Exception $e) {}
try { $user->assignRole($roleSanctum); } catch (\Exception $e) {}
try { $user->assignRole($roleApi); } catch (\Exception $e) {}

echo "Roles assigned.\n";
dump($user->roles->pluck('name', 'guard_name'));
exit
