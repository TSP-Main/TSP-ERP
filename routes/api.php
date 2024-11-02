<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Companies\CompanyController;
use App\Http\Controllers\Api\Employee\EmployeeController;
use App\Http\Controllers\Api\Schedule\ScheduleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('test', function () {
    return response()->json(['message' => 'Test successful']);
});


/*
 * Auth Apis
 */

Route::post('verify-email', [AuthController::class, 'verifyEmail'])->name('verify-email');
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
Route::match(['get', 'post'], 'reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
Route::post('/create-password/{user}', [AuthController::class, 'createPassword']);
Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::get('approve-user/{user}', [AuthController::class, 'approveUser']);
    Route::post('update-profile', [AuthController::class, 'updateProfile']);
});


// Route::get('email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify'); // Make sure to keep this as your route name
// Route::get('email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

Route::middleware('auth:api')->group(function () {

    // Company routes
    Route::prefix('company')->group(function () {
        Route::get('get-companies', [CompanyController::class, 'index']);
        Route::get('show-companies', [CompanyController::class, 'show']);
        Route::delete('delete-company/{user}', [CompanyController::class, 'destroy']);
    });

    // Employee routes
    Route::prefix('employee')->group(function () {
        Route::post('add-employee', [EmployeeController::class, 'create']);
        Route::get('all-employees/{companyCode}', [EmployeeController::class, 'allEmployees']);
        Route::get('show-employee/{user}', [EmployeeController::class, 'show']);
    });

    // Schedule routes
    Route::prefix('schedule')->group(function () {
        Route::post('create-schedule', [ScheduleController::class, 'create']);
        Route::post('assign-schedule', [ScheduleController::class, 'assignSchedule']);
        // Route::post('attendance', [ScheduleController::class, 'attendance']);
        Route::post('check-in/{employee}', [ScheduleController::class, 'checkIn']);
        Route::post('check-out/{employee}', [ScheduleController::class, 'checkOut']);
    });
});
