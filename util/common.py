import io
import json

def load_businesses(filepath, city=None):
    """Loads all of the Yelp businesses from |filepath| into a dictionary
    mapping business_id -> business data. If a city string is specified,
    load_businesses only loads business from the given city.
    """
    businesses = {}
    with io.open(filepath, 'rb') as businesess_file:
        for business in businesess_file:
            business_json = json.loads(business)
            if city == None or city.lower() == business_json['city'].lower():
                businesses[business_json['business_id']] = business_json

    return businesses
