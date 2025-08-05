<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out'])->default('in');
            $table->integer('quantity');
            $table->string('reason');
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->timestamps();

            $table->index(['inventory_item_id', 'created_at']);
            $table->index(['type']);
            $table->index(['reason']);
            $table->index(['performed_by']);
            $table->index(['reference_id', 'reference_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_transactions');
    }
}; 