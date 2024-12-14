from django.shortcuts import render
from django.http import JsonResponse
from twilio.rest import Client
from django.conf import settings

def send_sms(request):
    if request.method == "POST":
        # Get the recipient phone number from the form
        recipient_number = request.POST.get('phone_number')

        # Create a Twilio client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Send the message
        message = client.messages.create(
            body="Hello, this is a test message from Twilio!",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=recipient_number
        )
        
        # Return a JSON response indicating the result
        return JsonResponse({"message": "SMS sent successfully!"})
    return render(request, 'send_sms.html')
