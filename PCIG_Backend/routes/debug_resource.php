<?php

use Illuminate\Support\Facades\Route;
use App\Models\Property;
use App\Http\Resources\PropertyResource;

Route::get('/debug-resource', function () {
    $properties = Property::take(5)->get();
    return PropertyResource::collection($properties);
});
