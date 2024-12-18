<?php

namespace Database\Seeders;

use App\Classes\StatusEnum;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin user
        $superAdminEmail = 'superadmin@superadmin.com';
        $superAdmin = User::firstOrCreate(
            ['email' => $superAdminEmail],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@superadmin.com',
                'password' => Hash::make('password'),
                'is_active' => 1,
                'status' => StatusEnum::APPROVED,
                'otp_verified' => StatusEnum::OTP_VERIFIED
            ]
        )->assignRole('super_admin');

        // Create Company/Admin user
        $companyEmail = 'company@company.com';
        $company = User::firstOrCreate(
            ['email' => $companyEmail],
            [
                'name' => 'Company Inc.',
                'password' => Hash::make('password'),
                'is_active' => 1,
                'status' => StatusEnum::APPROVED,
                'otp_verified' => StatusEnum::OTP_VERIFIED
            ]
        )->assignRole('company');

        $companyProfile = CompanyModel::firstOrCreate([
            'user_id' => $company->id,
            'name' => 'Company Inc.',
            'slug' => 'company-inc',
            'code' => 'CPM-67175A6A1BGKT',
            'logo' => ''
        ]);

        // Create Manager user
        $mangerEmail = 'manager@manager.com';
        $manger = User::firstOrCreate(
            ['email' => $mangerEmail],
            [
                'name' => 'Manager',
                'password' => Hash::make('password'),
                'is_active' => 1,
                'status' => StatusEnum::APPROVED,
                'otp_verified' => StatusEnum::OTP_VERIFIED
            ]
        )->assignRole('manager');

        $managerProfile = Manager::firstOrCreate([
            'user_id' => $manger->id,
            'company_code' => $companyProfile->code,
            'joining_date' => '2024-12-03',
            'employment_type' => 'permanent',
            'is_active' => 1,
            'status' => StatusEnum::APPROVED
        ]);

        // Create Employee User
        $employeeEmail = 'employee@employee.com';
        $employee = User::firstOrCreate(
            ['email' => $employeeEmail],
            [
                'name' => 'Employee',
                'password' => Hash::make('password'),
                'is_active' => 1,
                'status' => StatusEnum::APPROVED,
                'otp_verified' => StatusEnum::OTP_VERIFIED
            ]
        )->assignRole('employee');

        $managerProfile = Employee::firstOrCreate([
            'user_id' => $employee->id,
            'manager_id' => $managerProfile->id,
            'company_code' => $companyProfile->code,
            'joining_date' => '2024-12-03',
            'employment_type' => 'permanent',
            'is_active' => 1,
            'status' => StatusEnum::APPROVED
        ]);
    }
}
