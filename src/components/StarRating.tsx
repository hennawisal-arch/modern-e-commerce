import { Star } from "lucide-react";

const StarRating = ({ rating, reviews }: { rating: number; reviews?: number }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
    {reviews !== undefined && <span className="text-sm text-muted-foreground">({reviews})</span>}
  </div>
);

export default StarRating;
