import PropTypes from 'prop-types'
import config from '../config'

const RecipeCard = ({ recipe, onClick }) => {
  const getCalorieClass = (calories) => {
    if (calories < 500) return 'lowCalorie'
    if (calories < 750) return 'mediumCalorie'
    return 'highCalorie'
  }

  const imageUrl = `${config.SMALL_IMAGE_BASE_URL}${recipe['HelloFresh ID']}.jpg`

  return (
    <div
      className={`recipe-item ${getCalorieClass(recipe.Calories)}`}
      onClick={() => onClick(recipe)}
    >
      <img src={imageUrl} alt={recipe['Full Name']} />
      <h3 className="name">{recipe['Full Name']}</h3>
      <p className="recipestat calories">{recipe.Calories} kcal</p>
      <p className="recipestat time">{recipe['Prep Time Minutes']} mins</p>
      {recipe['Has Card PDF'] && (
        <a
          href={`${config.RECIPE_CARD_BASE_URL}${recipe['HelloFresh ID']}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="recipestat pdf"
          onClick={(e) => e.stopPropagation()}
        >
          PDF
        </a>
      )}
    </div>
  )
}

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    'Full Name': PropTypes.string.isRequired,
    'HelloFresh ID': PropTypes.string.isRequired,
    'Thumbnail URL': PropTypes.string.isRequired,
    Calories: PropTypes.number.isRequired,
    'Prep Time Minutes': PropTypes.string.isRequired,
    'Has Card PDF': PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func.isRequired
}

export default RecipeCard 