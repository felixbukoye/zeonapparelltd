import CollectionBuilder from "../CollectionBuilder";

export default function NewCollectionPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
        Build a Collection
      </h1>
      <p className="mb-5 mt-1 text-sm text-mist-500">
        Your facility&apos;s approved uniform menu — styles, colours and
        embroidery rules.
      </p>
      <CollectionBuilder />
    </div>
  );
}
