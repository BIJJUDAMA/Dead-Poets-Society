const SkeletonCard = () => (
    <div className="relative w-full h-72">
        {/* Main card body */}
        <div
            className="block bg-no-repeat bg-center bg-contain p-8 w-full h-full"
            style={{ backgroundImage: "url('/postIt.png')" }}
        >
            <div className="text-center font-handwriting animate-pulse">
                {/* Title placeholder */}
                <div className="h-7 bg-gray-700 rounded w-3/4 mx-auto mb-3"></div>
                {/* Author placeholder */}
                <div className="h-5 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
                {/* Text lines placeholder */}
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
            </div>
        </div>
    </div>
);

export default SkeletonCard;
