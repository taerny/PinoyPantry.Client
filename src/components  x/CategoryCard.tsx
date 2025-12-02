interface CategoryCardProps {
  title: string;
  icon: string;
  itemCount: number;
}

export function CategoryCard({ title, icon, itemCount }: CategoryCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-[#F9A825]">
      <div className="text-4xl mb-3 text-center">{icon}</div>
      <h3 className="text-center mb-1">{title}</h3>
      <p className="text-center text-muted-foreground text-sm">{itemCount} items</p>
    </div>
  );
}
