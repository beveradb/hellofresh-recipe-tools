import { useState, useEffect } from 'react'
import RecipeCard from './components/RecipeCard'
import FilterPanel from './components/FilterPanel'
import RecipeModal from './components/RecipeModal'
import config from './config'
import './App.css'

function App() {
  const [recipes, setRecipes] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    maxCalories: 2000,
    maxPrepTime: 120,
    cuisine: '',
    ingredients: {
      include: [],
      exclude: []
    },
    ingredientSearch: ''
  })
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  useEffect(() => {
    fetch(`${config.RECIPES_JSON_URL}`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading recipes:', error)
        setLoading(false)
      })
  }, [])

  const filteredRecipes = recipes
    .filter(recipe => {
      // Text search
      const matchesSearch = recipe['Full Name'].toLowerCase().includes(filters.search.toLowerCase())
      
      // Calories filter
      const matchesCalories = recipe.Calories <= filters.maxCalories
      
      // Prep time filter
      const matchesPrepTime = parseInt(recipe['Prep Time Minutes']) <= filters.maxPrepTime
      
      // Cuisine filter
      const matchesCuisine = !filters.cuisine || recipe.Cuisines === filters.cuisine
      
      // Ingredients filters
      const recipeIngredients = recipe.Ingredients.split(', ').map(i => i.trim())
      const hasIncludedIngredients = filters.ingredients.include.length === 0 || 
        filters.ingredients.include.every(ing => recipeIngredients.includes(ing))
      const hasNoExcludedIngredients = filters.ingredients.exclude.length === 0 ||
        !filters.ingredients.exclude.some(ing => recipeIngredients.includes(ing))

      return matchesSearch && 
             matchesCalories && 
             matchesPrepTime && 
             matchesCuisine && 
             hasIncludedIngredients && 
             hasNoExcludedIngredients
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'calories':
          return a.Calories - b.Calories
        case 'time':
          return parseInt(a['Prep Time Minutes']) - parseInt(b['Prep Time Minutes'])
        case 'favorites':
          return b['HelloFresh User Favourites'] - a['HelloFresh User Favourites']
        default:
          return a['Full Name'].localeCompare(b['Full Name'])
      }
    })

  if (loading) return <div className="loading">Loading recipes...</div>

  return (
    <div className="app">
      <header>
        <h1>Recipe Browser</h1>
        <FilterPanel 
          recipes={recipes} 
          filters={filters} 
          setFilters={setFilters} 
        />
      </header>
      <main className="recipe-grid">
        <div className="results-count">
          Found {filteredRecipes.length} recipes
        </div>
        {filteredRecipes.map(recipe => (
          <RecipeCard 
            key={recipe['HelloFresh ID']} 
            recipe={recipe}
            onClick={setSelectedRecipe}
          />
        ))}
      </main>
      
      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  )
}

export default App
