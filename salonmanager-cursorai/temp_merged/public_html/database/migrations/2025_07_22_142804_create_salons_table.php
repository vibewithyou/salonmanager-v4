<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    	public function up(): void
	{
    		Schema::create('salons', function (Blueprint $table) {
       			$table->id();
        		$table->string('name');
        		$table->string('address');
        		$table->string('city');
        		$table->decimal('price_range_min', 6, 2)->nullable();
        		$table->decimal('price_range_max', 6, 2)->nullable();
        		$table->decimal('latitude', 10, 7);
        		$table->decimal('longitude', 10, 7);
        		$table->boolean('has_free_appointments')->default(false);
        		$table->timestamps();
    		});
	}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salons');
    }
};
