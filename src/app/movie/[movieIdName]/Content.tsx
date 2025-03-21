"use client";

import React, { useEffect, useState } from "react";
import "@/styles/pages/Content.scss";
import UserCard from "@/components/card/usercard/UserCard";
import ReviewCard from "@/components/card/reviewcard/ReviewCard";
import ImageCard from "@/components/card/image-card/ImageCard";
import RecommendationCard from "@/components/card/recommendationCard/RecommendationCard";
import LanguageAbbrevations from "@/lib/constants/LanguageAbbrevations";
import type {
  MovieCreditsResponse,
  MovieImageResponse,
  MovieReviewResponse,
  Movie,
  Keyword,
} from "@/types/movieDataAPI.types";

//icons
import facebook_icon from "@/assets/image/facebook_icon.png";
import twitterx_icon from "@/assets/image/twitterx_icon.png";
import instagram_icon from "@/assets/image/instagram_icon.png";
import link_icon from "@/assets/image/link_icon.png";
import CommentCard from "@/components/card/comment-card/CommentCard";
import api from "@/lib/utils/axiosInstance";
import { useUser } from "@clerk/nextjs";

//Abbriviation Map
const abbreviationMap = LanguageAbbrevations();

interface ContentProps {
  credits: MovieCreditsResponse | null;
  images: MovieImageResponse | null;
  reviews: MovieReviewResponse["results"] | null;
  recommendations: Movie[] | null;
  links: {
    facebook: string;
    twitter: string;
    instagram: string;
    homepage: string;
  };
  details: {
    status: string;
    original_language: string;
    budget: number;
    revenue: number;
  };
  keywords: Keyword[] | null;
}

function Content(props: ContentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  console.log("Email current user: ", user?.primaryEmailAddress );
  console.log("This is reviews: ", props.reviews)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!props.credits?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/reviews?filmId=${props.credits.id}`);
        setReviews(response.data.data ?? []);
        console.log("Fetched reviews:", response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    const insertReviews = async () => {
      if (!props.reviews || props.reviews.length === 0) return;
      try {
        await api.post("/reviews/insert",
          { filmId: props.credits?.id, reviews: props.reviews });
        console.log("Insert reviews success!");
      } catch (error) {
        console.error("Error creating reviews:", error);
      } finally {
        fetchReviews();
      }
    };

    fetchReviews();

    if (props.reviews && props.reviews.length > 0) {
      insertReviews();
    }
  }, [props.credits?.id, props.reviews]);

  if (loading) return <div>Loading...</div>;
  const cast = props.credits?.cast ?? [];
  const cast_slice = cast.slice(0, 9);
  // console.log("Cast slice: ", cast_slice);
  const images = props.images?.backdrops ?? [];
  const image_slice = images.slice(0, 15);
  return (
    <div className="content_wrapper">
      <section className="left">
        {/* For casts and crews of the movie */}
        <section className="top_billed">
          <h3>Top Billed Cast</h3>
          <div className="cast_scroller">
            <UserCard cast={cast_slice} />
          </div>
          <p>
            <a href="null" rel="norefferrer" target="_blank">
              Full Cast & Crew
            </a>
          </p>
        </section>

        {/* For Images and Medias of the movie */}
        <section className="images">
          <h3>Images</h3>
          <div className="image_scroller">
            {image_slice.map((item, index) => {
              return <ImageCard key={index} imageUrl={item.file_path} />;
            })}
          </div>
        </section>

        {/* For Review of the movie */}
        <section className="social_panel">
          <section className="review">
            <div className="menu mb-2">
              <h3>Social Review</h3>
            </div>
            {reviews.find(x => x.author_details.username === user?.primaryEmailAddress?.toString()) ? <></> : <div className="content">
              <CommentCard filmId={props.credits?.id} setReviews={setReviews} />
            </div>}
            <div className="content">
              <ReviewCard reviews={reviews} userId={user?.id} setReviews={setReviews} />
            </div>
          </section>
        </section>

        {/* For Recommondations of the movie */}
        <section className="recommendation_panel">
          <section className="recommendation">
            <div className="menu">
              <h3>Recommendations</h3>
            </div>
            <div className="content">
              <RecommendationCard recommendations={props.recommendations ?? []} />
            </div>
          </section>
        </section>
      </section>

      {/* Right section For Social links, keywords and extras */}
      <section className="right">
        <div className="social_links">
          <div>
            <a
              href={props.links.facebook}
              target="_blank"
              rel="noreferrer"
              title="Facebook link"
            >
              <span
                style={{ backgroundImage: `url(${facebook_icon.src})` }}
              ></span>
            </a>
          </div>
          <div>
            <a
              href={props.links.twitter}
              target="_blank"
              rel="noreferrer"
              title="Twitter link"
            >
              <span
                style={{ backgroundImage: `url(${twitterx_icon.src})` }}
              ></span>
            </a>
          </div>
          <div>
            <a
              href={props.links.instagram}
              target="_blank"
              rel="noreferrer"
              title="Instagram link"
            >
              <span
                style={{ backgroundImage: `url(${instagram_icon.src})` }}
              ></span>
            </a>
          </div>
          <div className="homepage">
            <a
              href={props.links.homepage}
              target="_blank"
              rel="noreferrer"
              title="Homepage link"
            >
              <span style={{ backgroundImage: `url(${link_icon.src})` }}></span>
            </a>
          </div>
        </div>

        <p>
          <strong>Status</strong>
          <br />
          {props.details.status}
        </p>
        <p>
          <strong>Original language</strong>
          <br />
          {abbreviationMap[
            props.details.original_language as keyof typeof abbreviationMap
          ] || props.details.original_language}
        </p>
        <p>
          <strong>Budget</strong>
          <br />
          {props.details.budget === 0
            ? "-"
            : props.details.budget.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
        </p>
        <p>
          <strong>Revenue</strong>
          <br />
          {props.details.revenue === 0
            ? "-"
            : props.details.revenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
        </p>

        <section className="keywords_panel">
          <h4>
            <strong>Keywords</strong>
          </h4>
          <ul>
            {props.keywords?.map((item, index) => {
              return (
                <li key={index} data-keyword-id={item.id}>
                  {item.name}
                </li>
              );
            })}
          </ul>
        </section>
      </section>
    </div>
  );
}

export default Content;
