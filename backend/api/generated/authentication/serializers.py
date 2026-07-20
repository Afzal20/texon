from rest_framework import serializers
from .models import *

class ForgotPasswordSerializer(serializers.ModelSerializer):

    class Meta:
        model = ForgotPassword
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = Login
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Register
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ResetPasswordSerializer(serializers.ModelSerializer):

    class Meta:
        model = ResetPassword
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class UpdatePasswordSerializer(serializers.ModelSerializer):

    class Meta:
        model = UpdatePassword
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['id', 'email', 'is_verified', 'date_joined', 'created_at', 'updated_at']

class VerifyOTPSerializer(serializers.ModelSerializer):

    class Meta:
        model = VerifyOTP
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
