import React from "react";

type CardProps = {
  linkedObjecttop: {
    id: string;
    title: string;
    imageUrl: string;
    link: string;
  };
};

const Card: React.FC<CardProps> = ({ linkedObjecttop }) => {
  return (
      <div key={linkedObjecttop.id} className="p-4">
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
          <a href={linkedObjecttop.link}>
            <img
                alt="News thumbnail"
                width={550}
                height={287}
                decoding="async"
                className="w-full h-auto"
                src={linkedObjecttop.imageUrl || "/static/img/nothumb.jpeg"}
            />
            <div className="p-4">
              <h6 className="text-lg font-semibold text-gray-900">
                {linkedObjecttop.title}
              </h6>
              <p className="text-base text-gray-700">Sample story by cfg by code</p>
            </div>
          </a>
        </div>
      </div>
  );
};

export default Card;