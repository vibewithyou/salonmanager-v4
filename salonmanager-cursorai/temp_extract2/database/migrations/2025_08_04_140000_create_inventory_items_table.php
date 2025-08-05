<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salon_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->string('location')->nullable();
            $table->timestamp('expiry_date')->nullable();
            $table->string('batch_number')->nullable();
            $table->text('qr_code')->nullable();
            $table->text('notes')->nullable();
            $table->integer('minimum_stock')->default(5);
            $table->integer('maximum_stock')->nullable();
            $table->integer('reorder_point')->nullable();
            $table->timestamp('last_restocked_at')->nullable();
            $table->timestamp('last_audit_at')->nullable();
            $table->timestamps();

            $table->index(['salon_id', 'product_id']);
            $table->index(['quantity']);
            $table->index(['expiry_date']);
            $table->index(['qr_code']);
            $table->index(['location']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_items');
    }
}; 