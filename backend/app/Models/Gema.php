<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Gema extends Model
{
    use HasFactory;

    public const OPEN_TIMEZONE = 'Asia/Jakarta';

    protected $fillable = [
        'slug',
        'title',
        'track_title',
        'track_artist',
        'spotify_id',
        'spotify_url',
        'apple_music_url',
        'cover_url',
        'recipient',
        'sender',
        'message',
        'mood',
        'reveal_at',
        'open_on',
        'reply_to_gema_id',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where(function (Builder $query) {
            $query->whereNull('open_on')->orWhere('open_on', '<=', self::todayForOpening());
        });
    }

    public static function todayForOpening(): string
    {
        return now(self::OPEN_TIMEZONE)->toDateString();
    }

    public function isLocked(): bool
    {
        return $this->open_on !== null && $this->open_on > self::todayForOpening();
    }

    public function originalGema(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_gema_id');
    }

    protected static function booted(): void
    {
        static::creating(function (Gema $gema) {
            if (empty($gema->slug)) {
                $gema->slug = Str::random(10);
            }
        });
    }
}
