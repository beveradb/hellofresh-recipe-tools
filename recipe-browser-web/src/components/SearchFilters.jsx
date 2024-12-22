import PropTypes from 'prop-types'

const SearchFilters = ({ filters, setFilters }) => {
  return (
    <div className="filters">
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
      <div className="calorie-filter">
        <label>
          Max Calories:
          <input
            type="range"
            min="0"
            max="2000"
            value={filters.maxCalories}
            onChange={(e) => setFilters(prev => ({ ...prev, maxCalories: Number(e.target.value) }))}
          />
          {filters.maxCalories} kcal
        </label>
      </div>
    </div>
  )
}

SearchFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired,
    maxCalories: PropTypes.number.isRequired
  }).isRequired,
  setFilters: PropTypes.func.isRequired
}

export default SearchFilters 