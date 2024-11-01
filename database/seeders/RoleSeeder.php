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

            //company
            'delete-company',
            'approve-company',

            //manager
            'approve-manager',

            //employee
            'approve-employee',
            'show-employees',
            'create-employee',

            //schedule
            'create-schedule',
            'update-schedule',
            'delete-schedule',
            'assign-schedule',

            //attendance
            'add-attendance',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Sync all permissions with super admin role
        // $superAdmin->syncPermissions(Permission::all());
        $superAdmin->givePermissionTo(Permission::all());

        // Assign specific permissions to comapny
        $companyPermission = [
            'approve-manager',
            'approve-employee',
            'create-employee',
            'create-schedule',
            'update-schedule',
            'delete-schedule',
            'show-employees',
            'assign-schedule',
        ];
        $company->givePermissionTo($companyPermission);

        // Assign specific permissions to manger
        $manager->syncPermissions([
            'approve-employee',
            'create-schedule',
            'update-schedule',
            'show-employees',
            'assign-schedule',
            'add-attendance',
        ]);

        // Assign specific permissions to employee
        $employee->syncPermissions([]);
    }
}
