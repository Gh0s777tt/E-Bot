import WishlistManager from '../../components/WishlistManager';
import { getWishlist } from '../../lib/wishlist';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const items = await getWishlist(100);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Lista życzeń gier — wyszukaj tytuł (autouzupełnianie z IGDB), zapisz z okładką i rokiem.
        Widoczna też z poziomu bota: <code className="text-accent">/wishlist</code>.
      </p>
      <WishlistManager initial={items} />
    </div>
  );
}
