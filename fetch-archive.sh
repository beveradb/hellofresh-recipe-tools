#!/bin/bash

# Check we're running from a tmux session - you probably want to run this from one!
if ! { [ "$TERM" = "screen" ] && [ -n "$TMUX" ]; } then
  echo "Please run from a tmux session"
  exit
fi

if ! [ `basename "$PWD"` = "hellofresh-recipe-tools" ]; then
  echo "Please run from within hellofresh-recipe-tools directory"
  exit
fi

# All of the HelloFresh API requests below require an Authorization header which you can get by making an initial request on the public HelloFresh website and inspecting network requests with DevTools

# First, fetch data about what recipes actually exist from HelloFresh recipe search API
curl "https://gw.hellofresh.com/api/recipes/search?offset=0&limit=5000&q=&locale=en-GB&country=gb" \
-H "origin: https://www.hellofresh.co.uk" \
-H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDIyNDQ5MzYsImp0aSI6ImY2YTE1NTM5LWE5Y2UtNDNmMi1iMTllLWEzN2M3ZDkwZDU2YyIsImlhdCI6MTQ5OTYxNTE5MywiaXNzIjoic2VuZiJ9._syKk7fDOEDsvo-x6kbxvUq_WFEzGdw62ccg6RCLJjQ" \
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

# Pretty-print the recipe metadata JSON for easier viewing and manipulation with unix tools
cat all-recipes-search.json | jq '.' > all-recipes-search-pretty.json

# Perform actions for all known recipe IDs
cat all-recipes-search.json | jq '.items[].id' | sed 's/"//g' | while read recipeID; do 

  echo "Processing recipe with ID: $recipeID"
  
  # Fetch recipe data JSON from API, only if we don't already have it
  if [ ! -f ../recipes/$recipeID ]; then
	echo "Fetching recipe data from HelloFresh API for new recipe with ID: $recipeID"

	curl "https://gw.hellofresh.com/api/recipes/$recipeID" \
	-H "origin: https://www.hellofresh.co.uk" \
	-H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDIyNDQ5MzYsImp0aSI6ImY2YTE1NTM5LWE5Y2UtNDNmMi1iMTllLWEzN2M3ZDkwZDU2YyIsImlhdCI6MTQ5OTYxNTE5MywiaXNzIjoic2VuZiJ9._syKk7fDOEDsvo-x6kbxvUq_WFEzGdw62ccg6RCLJjQ" \
	-H "accept-encoding: gzip, deflate, br" \
	-H "accept-language: en-GB,en;q=0.8,ca;q=0.6" \
	-H "accept: application/json, text/plain, */*" \
	-H "pragma: no-cache" \
	-H "cache-control: no-cache" \
	-H "authority: gw.hellofresh.com" \
	-H "referer: https://www.hellofresh.co.uk/recipe-archive/search/?q=andrew" \
	-H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36" \
	--compressed \
	-o ../recipes/$recipeID
  else
	echo "Recipe data JSON cached, no need to re-fetch for ID: $recipeID"
  fi

  # Perform more tasks with data from the recipe JSON
  if [ -f ../recipes/$recipeID ]; then

	# If we don't already have this recipe webpage cached, download it
	if [ ! -f ../webpages/$recipeID.html ]; then
		cat ../recipes/$recipeID | jq '.websiteUrl' | xargs -n 1 curl -o ../webpages/$recipeID.html
	fi
	
	# If we don't already have the recipe card PDF cached, download it
        if [ ! -f ../cards/$recipeID.pdf ]; then
                cat ../recipes/$recipeID | jq '.cardLink' | xargs -n 1 curl -o ../cards/$recipeID.pdf
        fi
  else
	echo "Recipe data JSON file still did not exist after second check, an error likely occurred when attempting to fetch ID: $recipeID"
  fi
done

exit

