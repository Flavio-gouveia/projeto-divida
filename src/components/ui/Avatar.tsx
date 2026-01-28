import React from 'react'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 text-lg'
  }

  const getInitial = (name?: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Fallback para avatar com inicial se a imagem falhar
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }

  return (
    <>
      {/* Avatar com imagem */}
      {src && (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
          onError={(e) => {
            // Esconder imagem com erro
            e.currentTarget.style.display = 'none'
            // Mostrar fallback
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) {
              fallback.classList.remove('hidden')
            }
          }}
        />
      )}
      
      {/* Fallback com inicial */}
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          bg-gray-300 
          flex 
          items-center 
          justify-center 
          text-white 
          font-medium
          ${src ? 'hidden' : ''}
          ${className}
        `}
      >
        {getInitial(name)}
      </div>
    </>
  )
}

export default Avatar
