import WishlistManager from '../../components/WishlistManager';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';
import { getWishlist } from '../../lib/wishlist';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const [items, lang] = await Promise.all([getWishlist(100), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.wishlist.intro')}</p>
      <WishlistManager initial={items} />
    </div>
  );
}
