import io
import json
import common

def main():
    businesses = common.load_businesses(
        '../data/yelp_academic_dataset_business.json',
        city='Las Vegas')

    # Read in checkins for appropriate businsses
    checkins = []
    with io.open('../data/yelp_academic_dataset_checkin.json',
                 'rb') as checkins_file:
        for checkins_entry in checkins_file:
            checkins_json = json.loads(checkins_entry)
            if checkins_json['business_id'] in businesses:
                checkins.append(checkins_json)

    checkins_output_json = {
        'businesses': [{
                'business_id': checkins_entry['business_id'],
                'latitude': businesses[checkins_entry['business_id']]['latitude'],
                'longitude': businesses[checkins_entry['business_id']]['longitude']
            }
            for checkins_entry in checkins
        ],
    }

    # Transform the checkin data to a desired format
    for day in range(7):
        for hour in range(24):
            hour_day = '%d-%d' % (hour, day)
            checkin_info = []
            for checkins_entry in checkins:
                if hour_day in checkins_entry['checkin_info']:
                    checkin_info.append(checkins_entry['checkin_info'][hour_day])
                else:
                    checkin_info.append(0)

            checkins_output_json[hour_day] = checkin_info

    # Output json file of checkins
    with io.open('../data/checkins.json', 'wb') as checkins_outfile:
        json.dump(checkins_output_json, checkins_outfile)

if __name__ == '__main__':
    main()
