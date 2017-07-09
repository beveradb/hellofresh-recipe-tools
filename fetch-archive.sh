#!/bin/bash

# All of the HelloFresh API requests below require an Authorization header which you can get by making an initial request on the public HelloFresh website and inspecting network requests with DevTools
# Once you've got one, set it here:
APIAuthorisationHeader="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDIyNDQ5MzYsImp0aSI6ImY2YTE1NTM5LWE5Y2UtNDNmMi1iMTllLWEzN2M3ZDkwZDU2YyIsImlhdCI6MTQ5OTYxNTE5MywiaXNzIjoic2VuZiJ9._syKk7fDOEDsvo-x6kbxvUq_WFEzGdw62ccg6RCLJjQ"

# Check we're running from a tmux session - you probably want to run this from one!
if ! { [ "$TERM" = "screen" ] && [ -n "$TMUX" ]; } then
  echo "Please run from a tmux session, ideally teeing the output into a log file!"
  exit
fi

if ! [ `basename "$PWD"` = "hellofresh-recipe-tools" ]; then
  echo "Please run from within hellofresh-recipe-tools directory"
  exit
fi

if ! hash jq 2>/dev/null; then
  echo "Please install jq to use this tool"
  exit
fi

# Ensure output directories exist
mkdir -p cards recipes webpages

# If we don't already have the recipe card PDF cached, download it
if [ ! -f all-recipes-search.json ]; then
	# Fetch data about what recipes actually exist (currently 1429 total) by slightly abusing the HelloFresh recipe search API
	echo -e "Fetching list of recipes from HelloFresh recipe search API using auth header: $APIAuthorisationHeader \n"
	
	curl "https://gw.hellofresh.com/api/recipes/search?offset=0&limit=10000&q=&locale=en-GB&country=gb" \
	-H "origin: https://www.hellofresh.co.uk" \
	-H "authorization: $APIAuthorisationHeader" \
	-H "accept-encoding: gzip, deflate, br" \
	-H "accept-language: en-GB,en;q=0.8,ca;q=0.6" \
	-H "accept: application/json, text/plain, */*" \
	-H "pragma: no-cache" \
	-H "cache-control: no-cache" \
	-H "authority: gw.hellofresh.com" \
	-H "referer: https://www.hellofresh.co.uk/recipe-archive/search/?q=andrew" \
	-H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36" \
	--compressed \
	-o all-recipes-search.json

else
	echo "Not re-fetching recipe search JSON as all-recipes-search.json already exists. Delete this and re-run to check for new recipes."
fi

# Pretty-print the recipe metadata JSON for easier viewing and manipulation with unix tools
cat all-recipes-search.json | jq '.' > all-recipes-search-pretty.json

# Perform actions for all known recipe IDs
cat all-recipes-search.json | jq '.items[].id' | sed 's/"//g' | while read recipeID; do 

  echo -e "\nProcessing recipe with ID: $recipeID"
  
  # Fetch recipe data JSON from API, only if we don't already have it
  if [ ! -f recipes/$recipeID ]; then
	echo -e "Fetching recipe data from HelloFresh API for new recipe with ID: $recipeID \n"

	curl "https://gw.hellofresh.com/api/recipes/$recipeID" \
	-H "origin: https://www.hellofresh.co.uk" \
	-H "authorization: $APIAuthorisationHeader" \
	-H "accept-encoding: gzip, deflate, br" \
	-H "accept-language: en-GB,en;q=0.8,ca;q=0.6" \
	-H "accept: application/json, text/plain, */*" \
	-H "pragma: no-cache" \
	-H "cache-control: no-cache" \
	-H "authority: gw.hellofresh.com" \
	-H "referer: https://www.hellofresh.co.uk/recipe-archive/search/?q=andrew" \
	-H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36" \
	--compressed \
	-o recipes/$recipeID
  else
	echo "Recipe data JSON cached, no need to re-fetch for ID: $recipeID"
  fi

  # Perform double check for recipe JSON before proceeding on to more tasks with data from that file
  if [ -f recipes/$recipeID ]; then

	# If we don't already have this recipe webpage cached, download it
	if [ ! -f webpages/$recipeID.html ]; then
	        echo -e "Downloading recipe HTML webpage from HelloFresh website for new recipe with ID: $recipeID \n"
		recipeWebpageURL=`cat recipes/$recipeID | jq '.websiteUrl' | sed 's/"//'`
		
		if ! [ "$recipeWebpageURL" == "null" ]; then
			echo "Fetching webpage URL with cURL: $recipeWebpageURL"
			curl -o webpages/$recipeID.html $recipeWebpageURL
			
			if [ $(stat -c%s webpages/$recipeID.html) -lt 10000 ]; then
				echo -e "Webpage fetched, but file webpages/$recipeID.html has size less than 10Kb; an error probably occurred, exiting \n"
				exit
			fi
		else
			echo "Found null webpageUrl for recipe with ID: $recipeID, exiting"
			exit
		fi
        else
                echo "Recipe HTML webpage cached, no need to re-fetch for ID: $recipeID"
	fi
	
	# If we don't already have the recipe card PDF cached, download it
        if [ ! -f cards/$recipeID.pdf ]; then
                echo -e "Downloading recipe card PDF from cloudfront CDN cardLink for new recipe with ID: $recipeID \n"
                recipeCardURL=`cat recipes/$recipeID | jq '.cardLink' | sed 's/"//'`

                if ! [ "$recipeCardURL" == "null" ]; then
                        echo "Fetching card PDF URL with cURL: $recipeCardURL"
                        curl -o cards/$recipeID.pdf $recipeCardURL

                        if [ $(stat -c%s cards/$recipeID.pdf) -lt 10000 ]; then
                                echo -e "Card PDF fetched, but file cards/$recipeID.pdf size less than 10Kb; an error probably occurred, exiting \n"
                                exit
                        fi
                else
                        echo "Found null cardLink for recipe with ID: $recipeID, skipping"
                fi
        else
		echo "Recipe card PDF cached, no need to re-fetch for ID: $recipeID"
	fi

	# Check if both webpage and PDF exist - if not, exit with error so we can investigate
	if [ -f webpages/$recipeID.html -o -f cards/$recipeID.pdf ]; then
                echo -e "Metadata JSON, plus card PDF OR webpage HTML cached successfully for recipe ID: $recipeID, moving on. \n"
        else
                echo "Both card and webpage download failed, exiting for investigation"
		exit
        fi

  else
	echo "Recipe data JSON file did not exist after second check, an error likely occurred when attempting to fetch ID: $recipeID"
	exit
  fi
done

exit

