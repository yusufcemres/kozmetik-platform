export default function NeedsListPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Cilt İhtiyaçları</h1>
      <p className="text-gray-500 mb-8">
        Cilt sorunlarını ve ihtiyaçlarını keşfet, her biri için en etkili içerik maddelerini öğren
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Sivilce / Akne', icon: '🔴', group: 'Cilt Sorunları' },
          { name: 'Leke / Hiperpigmentasyon', icon: '🟤', group: 'Cilt Sorunları' },
          { name: 'Kırışıklık / Yaşlanma', icon: '⏳', group: 'Cilt Sorunları' },
          { name: 'Kuruluk / Dehidrasyon', icon: '🏜️', group: 'Nem' },
          { name: 'Bariyer Desteği', icon: '🛡️', group: 'Bakım' },
          { name: 'Gözenek Sıkılaştırma', icon: '🔍', group: 'Cilt Sorunları' },
        ].map((need) => (
          <div
            key={need.name}
            className="border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
          >
            <span className="text-3xl">{need.icon}</span>
            <h3 className="font-bold mt-3">{need.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{need.group}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
