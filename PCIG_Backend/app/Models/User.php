<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_type',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    public function investorProfile()
    {
        return $this->hasOne(InvestorProfile::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function fundInvestments()
    {
        return $this->hasMany(FundInvestment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class);
    }

    public function shareListings()
    {
        return $this->hasMany(ShareListing::class, 'seller_id');
    }

    public function shareTransactionsAsBuyer()
    {
        return $this->hasMany(ShareTransaction::class, 'buyer_id');
    }

    public function latestKycVerification()
    {
        return $this->hasOne(KycVerification::class)->latestOfMany();
    }

    public function timeEntries()
    {
        return $this->hasMany(TimeEntry::class);
    }
}
