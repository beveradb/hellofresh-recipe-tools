import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'

const FilterPanel = ({ recipes, filters, setFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Extract unique ingredients from all recipes
  const allIngredients = useMemo(() => {
    const ingredientSet = new Set()
    recipes.forEach(recipe => {
      recipe.Ingredients.split(', ').forEach(ingredient => {
        ingredientSet.add(ingredient.trim())
      })
    })
    return Array.from(ingredientSet).sort()
  }, [recipes])

  // Extract unique cuisines
  const allCuisines = useMemo(() => {
    return Array.from(new Set(recipes.map(r => r.Cuisines))).filter(Boolean).sort()
  }, [recipes])

  const handleIngredientToggle = (ingredient, type) => {
    setFilters(prev => ({
      ...prev,
      ingredients: {
        include: type === 'include' 
          ? [...prev.ingredients.include, ingredient]
          : prev.ingredients.include.filter(i => i !== ingredient),
        exclude: type === 'exclude'
          ? [...prev.ingredients.exclude, ingredient]
          : prev.ingredients.exclude.filter(i => i !== ingredient)
      }
    }))
  }

  return (
    <div className="filter-panel">
      <div className="basic-filters">
        <input
          type="text"
          placeholder="Search recipes..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="search-input"
        />
        
        <select 
          value={filters.sortBy} 
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="calories">Sort by Calories</option>
          <option value="time">Sort by Prep Time</option>
          <option value="favorites">Sort by Favorites</option>
        </select>

        <button 
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h3>Calories</h3>
            <div className="range-filter">
              <input
                type="range"
                min="0"
                max="2000"
                value={filters.maxCalories}
                onChange={(e) => setFilters(prev => ({ ...prev, maxCalories: Number(e.target.value) }))}
              />
              <span>{filters.maxCalories} kcal</span>
            </div>
          </div>

          <div className="filter-section">
            <h3>Prep Time</h3>
            <div className="range-filter">
              <input
                type="range"
                min="0"
                max="120"
                value={filters.maxPrepTime}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrepTime: Number(e.target.value) }))}
              />
              <span>{filters.maxPrepTime} mins</span>
            </div>
          </div>

          <div className="filter-section">
            <h3>Cuisine</h3>
            <select
              value={filters.cuisine}
              onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
              className="cuisine-select"
            >
              <option value="">Any Cuisine</option>
              {allCuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          <div className="filter-section ingredients-filter">
            <h3>Ingredients</h3>
            <div className="ingredients-search">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={filters.ingredientSearch}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  ingredientSearch: e.target.value 
                }))}
              />
            </div>
            
            <div className="ingredients-lists">
              <div className="ingredient-column">
                <h4>Include Ingredients</h4>
                <div className="ingredients-scroll">
                  {allIngredients
                    .filter(ing => ing.toLowerCase().includes(filters.ingredientSearch.toLowerCase()))
                    .map(ingredient => (
                      <label key={`include-${ingredient}`} className="ingredient-label">
                        <input
                          type="checkbox"
                          checked={filters.ingredients.include.includes(ingredient)}
                          onChange={() => handleIngredientToggle(
                            ingredient,
                            filters.ingredients.include.includes(ingredient) ? 'remove' : 'include'
                          )}
                        />
                        {ingredient}
                      </label>
                    ))}
                </div>
              </div>

              <div className="ingredient-column">
                <h4>Exclude Ingredients</h4>
                <div className="ingredients-scroll">
                  {allIngredients
                    .filter(ing => ing.toLowerCase().includes(filters.ingredientSearch.toLowerCase()))
                    .map(ingredient => (
                      <label key={`exclude-${ingredient}`} className="ingredient-label">
                        <input
                          type="checkbox"
                          checked={filters.ingredients.exclude.includes(ingredient)}
                          onChange={() => handleIngredientToggle(
                            ingredient,
                            filters.ingredients.exclude.includes(ingredient) ? 'remove' : 'exclude'
                          )}
                        />
                        {ingredient}
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

FilterPanel.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired,
    maxCalories: PropTypes.number.isRequired,
    maxPrepTime: PropTypes.number.isRequired,
    cuisine: PropTypes.string.isRequired,
    ingredients: PropTypes.shape({
      include: PropTypes.arrayOf(PropTypes.string).isRequired,
      exclude: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    ingredientSearch: PropTypes.string.isRequired
  }).isRequired,
  setFilters: PropTypes.func.isRequired
}

export default FilterPanel 