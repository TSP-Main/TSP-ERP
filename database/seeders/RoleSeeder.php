<?php

namespace Database\Seeders;

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

            // all-users
            'get-all-users',

            //company
            'delete-company',
            'approve-company',
            'show-companies',
            'reject-company',

            //manager
            'approve-manager',
            'change-manager',

            //employee
            'approve-employee',
            'show-employees',
            'create-employee',
            'update-employee',
            'checkedin-employees',
            'reject-employee',
            'delete-employee',

            //schedule
            'create-schedule',
            'update-schedule',
            'delete-schedule',
            'assign-schedule',
            'employee-availability',

            //attendance
            'add-attendance',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Sync all permissions with super admin role
        $superAdmin->givePermissionTo(Permission::all());

        // Assign specific permissions to comapny
        $companyPermission = [
            'approve-manager',
            'approve-employee',
            'create-employee',
            'update-employee',
            'delete-employee',
            'create-schedule',
            'update-schedule',
            'delete-schedule',
            'show-employees',
            'assign-schedule',
            'checkedin-employees',
            'employee-availability',
            'reject-employee',
            'change-manager',
        ];
        $company->givePermissionTo($companyPermission);

        // Assign specific permissions to manger
        $manager->syncPermissions([
            'approve-employee',
            'create-employee',
            'update-employee',
            'delete-employee',
            'update-schedule',
            'show-employees',
            'assign-schedule',
            'add-attendance',
            'checkedin-employees',
            'employee-availability',
            'reject-employee',
        ]);

        // Assign specific permissions to employee
        $employee->syncPermissions([]);
    }
}
