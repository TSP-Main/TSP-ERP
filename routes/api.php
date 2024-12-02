<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Companies\CompanyController;
use App\Http\Controllers\Api\Employee\EmployeeController;
use App\Http\Controllers\Api\Payment\StripePaymentController;
use App\Http\Controllers\Api\Schedule\ScheduleController;
use Illuminate\Auth\Events\Authenticated;

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

// Handle OPTIONS requests
Route::options('{any}', function () {
    return response()->json([], 204);
})->where('any', '.*');

/*
 * Auth Apis
 */

Route::post('verify-password-otp', [AuthController::class, 'verifyForgetPasswordOtp']);

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
Route::match(['get', 'post'], 'reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
Route::post('/create-password/{user}', [AuthController::class, 'createPassword'])->name('create.password/{user}');
Route::post('register', [AuthController::class, 'register']);
Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::get('approve-user/{user}', [StripePaymentController::class, 'approveUser']);
    Route::post('update-profile', [AuthController::class, 'updateProfile']);
    Route::get('/user/details', [AuthController::class, 'loggedInUserDetail']);
    Route::get('get-all-users', [AuthController::class, 'getAllUsers']);
    Route::post('update-status/{id}', [AuthController::class, 'updateIsActiveStatus']);
    Route::post('user-reject/{user}', [AuthController::class, 'userReject']);
    Route::post('cancel-invitation/{user}', [AuthController::class, 'userInviteCancel']);
    Route::get('rejected-user/{companyCode}', [AuthController::class, 'rejectedUser']);
    Route::get('invited-user/{companyCode}', [AuthController::class, 'invitedUser']);
    Route::get('cancelled-user/{companyCode}', [AuthController::class, 'inviteCancelledUser']);
    Route::get('new-registered-user/{companyCode}', [AuthController::class, 'newSignUps']);
});

// Route::get('email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify'); // Make sure to keep this as your route name
// Route::get('email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

Route::middleware('auth:api')->group(function () {

    // Company routes
    Route::get('companies', [CompanyController::class, 'index']);
    Route::prefix('company')->group(function () {
        Route::get('show-companies', [CompanyController::class, 'show']);
        Route::delete('delete-company/{user}', [CompanyController::class, 'destroy']);
        Route::get('in-active-companies', [CompanyController::class, 'notApprovedCompanies']);
        Route::get('active-companies', [CompanyController::class, 'approvedCompanies']);
    });

    // Employee routes
    Route::get('all-employees/{companyCode}', [EmployeeController::class, 'allCompanyEmployees']);
    Route::prefix('employee')->group(function () {
        Route::post('add-employee', [EmployeeController::class, 'create']);
        Route::get('show-employee/{user}', [EmployeeController::class, 'show']);
        Route::get('in-active-employee/{companyCode}', [EmployeeController::class, 'inActiveEmployees']);
        Route::get('active-employee/{companyCode}', [EmployeeController::class, 'activeEmployees']);
        Route::post('update/{id}', [EmployeeController::class, 'update']);
        Route::post('delete/{user}', [EmployeeController::class, 'delete']);
    });

    // Schedule routes
    Route::get('company-schedule/{id}', [ScheduleController::class, 'getCompanySchedule']);
    Route::prefix('schedule')->group(function () {
        Route::post('create-schedule', [ScheduleController::class, 'create']);
        Route::post('update-schedule/{id}', [ScheduleController::class, 'update']);
        Route::post('delete-schedule/{id}', [ScheduleController::class, 'delete']);
        Route::post('assign-schedule', [ScheduleController::class, 'assignSchedule']);
        Route::get('employee-schedule/{id}', [ScheduleController::class, 'getEmployeeAssignedSchedule']);
        // Route::post('attendance', [ScheduleController::class, 'attendance']);
        Route::post('check-in/{employee}', [ScheduleController::class, 'checkIn']);
        Route::post('check-out/{employee}', [ScheduleController::class, 'checkOut']);
        Route::get('/working-hours', [ScheduleController::class, 'getWorkingHours']);
        Route::get('/checked-in-employees', [ScheduleController::class, 'getCurrentlyCheckedInEmployees']);
        Route::get('/attendance-time/{id}', [ScheduleController::class, 'checkInCheckOutTime']);
        Route::get('all-assigned-schedule/{id}', [ScheduleController::class, 'getCompanyassignedSchedule']);
        Route::get('missed-attended-schedule/{id}', [ScheduleController::class, 'missedAndAttendedSchedule']);

        //temprary store data
        Route::post('/add-employee-availability', [ScheduleController::class, 'submitAvailability']);
        Route::get('/employee-availability-dashboard/{companyCode}', [ScheduleController::class, 'getAvailabilityDashboard']);
    });
});
// stripe payment
Route::middleware(['api', 'web'])->group(function () {
    Route::post('/create-payment-intent', [StripePaymentController::class, 'createSubscriptionPaymentIntent']);
});
