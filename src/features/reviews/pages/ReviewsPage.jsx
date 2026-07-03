import { useState, useEffect } from "react";
import { getMyReviews } from "../../../shared/api";
import { Star } from "lucide-react";

export const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await getMyReviews();
                setReviews(data.reviews || []);
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center gap-3 mb-6">
                    <Star size={24} className="text-[#E67E22]" />
                    <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mis Reseñas</h1>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-[#E8D8C3] p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20">
                        <Star size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Aún no has escrito reseñas</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < review.calificacion ? "fill-[#E67E22] text-[#E67E22]" : "text-gray-300"}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-[#2B2B2B]">{review.comentario || "Sin comentario"}</p>
                                <p className="text-xs text-[#6B6B6B] mt-2">
                                    {new Date(review.createdAt).toLocaleDateString("es-GT", {
                                        day: "numeric", month: "long", year: "numeric"
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
