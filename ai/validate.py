from flask import jsonify, g
from firebase_admin import auth

def validate_token(request):
    print(">>>>>>>>>>>>>>> validate_token >>>>>>>>>>>>>>>")
    if request.headers.get('Authorization', '') == '':
        raise ValueError('validateToken: No token provided')
    # Extract the token from the request headers
    token = request.headers.get('Authorization', '').split('Bearer ')[1]
    if not token:
        raise ValueError('validateToken: No token provided')

    # Verify the token using the Firebase Admin SDK
    decoded_token = auth.verify_id_token(token)
    # Attach the decoded token to the request for further processing in your route handler
    g.decoded_token = decoded_token
    g.current_user = decoded_token['user']
    # If the token is valid, proceed with your protected API logic here
    # For example, you can extract the user ID from `decoded_token` and fetch user data
    # from your Firebase Realtime Database or Firestore
    print(g.current_user)
