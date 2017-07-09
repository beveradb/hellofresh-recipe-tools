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

# Parse recipe search JSON for API URLs to fetch proper recipe data JSON from API
cat all-recipes-search.json | jq '.items[].link' | sed -E 's/.https:.+(recipes.+).country=gb./https:\/\/gw.hellofresh.com\/api\/\1/g' > all-recipes-api-urls.txt


exit

# Parse this recipe search JSON for websiteUrl fields and output this into a separate list of URLs to fetch, in case there is data we can only scrape from the HTML
grep -oE 'websiteUrl": ".+"' all-recipes-search.json | sed 's/websiteUrl": //g' | sed 's/"//g' > all-recipes-website-urls.txt
# Fetch webpage HTML for all known recipes
cd ../webpages
cat ../tools/all-cards-website-urls.txt | parallel -j 20 --gnu "wget {}"

# Parse all webpage files for cardLink PDF URLs and output these to a list of URL mappings
grep -Po 'cardLink:"https://.*?cloudfront.net/card/.*?.pdf"' * | sed 's/cardLink://g' > ../tools/websites-card-url-mappings.txt
# 
cat ../tools/websites-card-url-mappings.txt | sed -E 's/.*?"(.+)"/\1/' > ../tools/all-card-pdf-urls.txt

cd ../cards
cat ../tools/all-card-pdf-urls.txt | parallel -j 20 --gnu "wget {}"

