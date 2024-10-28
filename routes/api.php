<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Passport\Passport;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\Employee\EmployeeController;

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

/*
 * Company
 */
Route::middleware('auth:api')->group(function () {
    Route::get('get-companies', [CompanyController::class, 'index']);
    Route::get('show-companies', [CompanyController::class, 'show']);
    Route::delete('delete-company/{user}', [CompanyController::class, 'destroy']);
});

/*
 * employee
 */
Route::middleware('auth:api')->group(function () {
    Route::post('add-employee', [EmployeeController::class, 'create']);
});
