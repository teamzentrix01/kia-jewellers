import { useState, useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useCategories(group) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/categories`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        
        const seen = new Set(); // Track duplicate slugs.
        const filtered = data
          .filter(c => c.group_label === group)
          .filter(c => {
            if (seen.has(c.slug)) return false; // Skip duplicates.
            seen.add(c.slug);
            return true;
          })
          .map(c => ({ name: c.name, slug: c.slug, img: c.image_url || '/placeholder.jpg' }));
        
        setCategories(filtered);
      })
      .catch(() => {});
  }, [group]);

  return categories;
}
