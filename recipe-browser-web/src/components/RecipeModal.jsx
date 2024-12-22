import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import config from '../config'

const RecipeModal = ({ recipe, onClose }) => {
  const dialogRef = useRef(null)

  const imageUrl = `${config.LARGE_IMAGE_BASE_URL}${recipe['HelloFresh ID']}.jpg`

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="recipe-modal"
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>

        <div className="modal-header">
          <img src={imageUrl} alt={recipe['Full Name']} />
          <h2>{recipe['Full Name']}</h2>
        </div>

        <div className="modal-body">
          <div className="recipe-stats">
            <div className="stat">
              <span className="label">Calories:</span>
              <span className="value">{recipe.Calories} kcal</span>
            </div>
            <div className="stat">
              <span className="label">Prep Time:</span>
              <span className="value">{recipe['Prep Time Minutes']} mins</span>
            </div>
            <div className="stat">
              <span className="label">Favourites:</span>
              <span className="value">{recipe['HelloFresh User Favourites']}</span>
            </div>
          </div>

          <div className="recipe-details">
            <h3>Description</h3>
            <p>{recipe.Description}</p>

            <h3>Ingredients ({recipe['Total Ingredients']})</h3>
            <ul className="ingredients-list">
              {recipe.Ingredients.split(', ').map(ingredient => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>

            <h3>Utensils Needed</h3>
            <ul className="utensils-list">
              {recipe.Utensils.split(', ').map(utensil => (
                <li key={utensil}>{utensil}</li>
              ))}
            </ul>

            {recipe.Tags && (
              <>
                <h3>Tags</h3>
                <div className="tags">
                  {recipe.Tags.split(', ').map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </>
            )}

            {recipe['Has Card PDF'] && (
              <div className="pdf-section">
                <a
                  href={`${config.RECIPE_CARD_BASE_URL}${recipe['HelloFresh ID']}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-button"
                >
                  View Recipe Card PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  )
}

RecipeModal.propTypes = {
  recipe: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

export default RecipeModal