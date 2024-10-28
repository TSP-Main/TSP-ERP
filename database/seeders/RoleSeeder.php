<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //create roles
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $company = Role::firstOrCreate(['name' => 'company']);
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $employee = Role::firstOrCreate(['name' => 'employee']);

        // Create permissions
        $permissions = [
            // Super Admin Permissions
            'home',
            'dashboard',
            'delete-company',
            'approve-company',
            'approve-manager',
            'approve-employee',
            'create-employee',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Sync all permissions with super admin role
        // $superAdmin->syncPermissions(Permission::all());
        $superAdmin->givePermissionTo(Permission::all());

        // Assign specific permissions to other roles except super_admin
        $companyPermission = [
            'approve-manager',
            'approve-employee',
            'create-employee',
        ];
        $company->givePermissionTo($companyPermission);
        $manager->syncPermissions([]);
        $employee->syncPermissions([]);
    }
}
