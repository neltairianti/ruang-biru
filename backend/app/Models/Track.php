<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'artist',
        'album',
        'duration',
        'icon',
        'cover_class',
        'spotify_id',
        'spotify_url',
        'cover_url',
    ];
}
