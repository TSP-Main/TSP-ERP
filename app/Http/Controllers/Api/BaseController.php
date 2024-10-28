<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller as Controller;


class BaseController extends Controller
{
    /**
     * Send a success response.
     *
     * @param  string|array  $data
     * @param  string  $message
     * @param  int  $status
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResponse($data=[], $message = 'Success', $status = 200): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $status);
    }

    /**
     * Send an error response.
     *
     * @param  string  $error
     * @param  int  $code
     * @param  int  $status
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendError($error, $code = 400, $status = 400): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'errors' =>$error,
            'code' => $code
        ], $status);
    }
}
