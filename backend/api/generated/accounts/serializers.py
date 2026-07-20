from rest_framework import serializers
from .models import *

class AccountsPayableSerializer(serializers.ModelSerializer):

    class Meta:
        model = AccountsPayable
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AccountsReceivableSerializer(serializers.ModelSerializer):

    class Meta:
        model = AccountsReceivable
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ChartOfAccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChartOfAccount
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class CostCenterSerializer(serializers.ModelSerializer):

    class Meta:
        model = CostCenter
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class InvoiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class JournalEntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
