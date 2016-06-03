import io
import json
import common

def main():
    businesses = common.load_businesses_list(
        '../data/yelp_academic_dataset_business.json',
        city='Las Vegas')

    # Output json file of checkins
    with io.open('../data/businesses.json', 'wb') as checkins_outfile:
        json.dump(businesses, checkins_outfile)

if __name__ == '__main__':
    main()
