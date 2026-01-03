import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { getBannerImageUrl, getCityImageUrl, getTripImageUrl } from '../utils/images';
import '../styles/global.css';

interface City {
  id: string;
  name: string;
  country: string;
  popularityScore: number;
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const Dashboard = () => {
  const [topCities, setTopCities] = useState<City[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cityImages, setCityImages] = useState<Record<string, string>>({});
  const [bannerImage, setBannerImage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      // Load banner image
      try {
        // Try to get a banner image from a popular city
        const citiesResponse = await api.searchCities();
        if (citiesResponse.data?.cities && citiesResponse.data.cities.length > 0) {
          const firstCity = citiesResponse.data.cities[0];
          const imageResponse = await api.getCityImages(firstCity.id);
          if (imageResponse.data?.images?.length > 0) {
            setBannerImage(imageResponse.data.images[0].urls?.regular || getBannerImageUrl());
          } else {
            setBannerImage(getBannerImageUrl());
          }
        } else {
          setBannerImage(getBannerImageUrl());
        }
      } catch (error) {
        setBannerImage(getBannerImageUrl());
      }
      try {
        // Load top cities
        const citiesResponse = await api.searchCities();
        if (citiesResponse.data?.cities) {
          const topCitiesList = citiesResponse.data.cities.slice(0, 5);
          setTopCities(topCitiesList);
          
          // Load images for top cities
          const images: Record<string, string> = {};
          await Promise.all(
            topCitiesList.map(async (city: City) => {
              try {
                const imageResponse = await api.getCityImages(city.id);
                if (imageResponse.data?.images?.length > 0) {
                  images[city.id] = imageResponse.data.images[0].urls?.regular || getCityImageUrl(city.name, city.country);
                } else {
                  images[city.id] = getCityImageUrl(city.name, city.country);
                }
              } catch (error) {
                images[city.id] = getCityImageUrl(city.name, city.country);
              }
            })
          );
          setCityImages(images);
        }

        // Load previous trips
        const tripsResponse = await api.getTrips('COMPLETED');
        if (tripsResponse.data?.trips) {
          setPreviousTrips(tripsResponse.data.trips.slice(0, 3));
        }

        // Load upcoming trips for budget highlights
        const upcomingResponse = await api.getTrips('UPCOMING');
        if (upcomingResponse.data?.trips) {
          setUpcomingTrips(upcomingResponse.data.trips);
          
          // Calculate total budget and spent
          let budget = 0;
          let spent = 0;
          upcomingResponse.data.trips.forEach((trip: Trip) => {
            budget += trip.budget || 0;
            // Calculate spent from sections (simplified - would need full trip data)
            // For now, we'll just show budget
          });
          setTotalBudget(budget);
          setTotalSpent(spent);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header />
      
      <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            marginBottom: '8px', 
            fontSize: '36px', 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>
            Welcome to GlobeTrotter
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-muted)',
            fontWeight: '400'
          }}>
            Plan your next adventure with ease
          </p>
        </div>

        {/* Budget Highlights */}
        {upcomingTrips.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              marginBottom: '16px', 
              fontSize: '20px', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Budget Summary
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <div className="container" style={{ 
                padding: '20px', 
                borderRadius: '8px'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: 'var(--accent-blue)',
                  marginBottom: '4px'
                }}>
                  ${totalBudget.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-muted)'
                }}>
                  Total Budget
                </div>
              </div>
              <div className="container" style={{ 
                padding: '20px', 
                borderRadius: '8px'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: '#4ade80',
                  marginBottom: '4px'
                }}>
                  ${totalSpent.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-muted)'
                }}>
                  Total Spent
                </div>
              </div>
              <div className="container" style={{ 
                padding: '20px', 
                borderRadius: '8px'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: '#f59e0b',
                  marginBottom: '4px'
                }}>
                  ${(totalBudget - totalSpent).toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-muted)'
                }}>
                  Remaining
                </div>
              </div>
              <div className="container" style={{ 
                padding: '20px', 
                borderRadius: '8px'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  {upcomingTrips.length}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-muted)'
                }}>
                  Upcoming Trips
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner Image */}
        <div className="container" style={{ 
          height: '280px', 
          marginBottom: '48px',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          border: 'none'
        }}>
          {bannerImage ? (
            <>
              <img 
                src={bannerImage}
                alt="Travel Banner"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.style.backgroundColor = 'var(--accent-blue)';
                  (e.target as HTMLImageElement).parentElement!.style.display = 'flex';
                  (e.target as HTMLImageElement).parentElement!.style.alignItems = 'center';
                  (e.target as HTMLImageElement).parentElement!.style.justifyContent = 'center';
                }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)',
                pointerEvents: 'none'
              }} />
            </>
          ) : (
            <div style={{ 
              color: 'white', 
              fontSize: '32px', 
              fontWeight: '700',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              Welcome to GlobeTrotter
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <SearchBar />

        {/* Recommended Destinations */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '28px' 
          }}>
            <div>
              <h2 style={{ 
                marginBottom: '8px',
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px'
              }}>
                Recommended Destinations
              </h2>
              <div style={{ 
                fontSize: '15px', 
                color: 'var(--text-muted)',
                fontWeight: '400'
              }}>
                Discover popular destinations based on current travel trends
              </div>
            </div>
            <button
              className="button"
              onClick={() => navigate('/search/cities')}
              style={{ 
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                border: '1px solid var(--accent-blue)',
                color: 'var(--accent-blue)',
                backgroundColor: 'transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-blue)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 158, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View All Cities
            </button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '24px' 
          }}>
            {loading ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px',
                color: 'var(--text-muted)',
                fontSize: '16px'
              }}>
                Loading destinations...
              </div>
            ) : topCities.length > 0 ? (
              topCities.map((city, idx) => {
                const colorClasses = ['card-blue', 'card-green', 'card-purple', 'card-orange', 'card-pink'];
                const colorClass = colorClasses[idx % colorClasses.length];
                return (
                  <div
                    key={city.id}
                    className={`container ${colorClass}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      padding: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onClick={() => navigate(`/search?city=${city.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <img
                      src={cityImages[city.id] || getCityImageUrl(city.name, city.country)}
                      alt={city.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCityImageUrl(city.name, city.country);
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                      color: 'white',
                      padding: '16px 12px 12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      textAlign: 'center',
                      letterSpacing: '0.2px'
                    }}>
                      {city.name}
                    </div>
                  </div>
                );
              })
            ) : (
              Array.from({ length: 5 }).map((_, i) => {
                const colorClasses = ['card-blue', 'card-green', 'card-purple', 'card-orange', 'card-pink'];
                const colorClass = colorClasses[i % colorClasses.length];
                return (
                  <div
                    key={i}
                    className={`container ${colorClass}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div style={{ marginBottom: '56px' }}>
          <h2 style={{ 
            marginBottom: '28px',
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px'
          }}>
            Previous Trips
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {loading ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px',
                color: 'var(--text-muted)',
                fontSize: '16px'
              }}>
                Loading trips...
              </div>
            ) : previousTrips.length > 0 ? (
              previousTrips.map((trip, idx) => {
                const colorClasses = ['card-cyan', 'card-purple', 'card-orange'];
                const colorClass = colorClasses[idx % colorClasses.length];
                return (
                  <div
                    key={trip.id}
                    className={`container ${colorClass}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      padding: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onClick={() => navigate(`/trips/view/${trip.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <img
                      src={getTripImageUrl(trip.name)}
                      alt={trip.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                      color: 'white',
                      padding: '20px 16px 16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      textAlign: 'center',
                      letterSpacing: '0.2px'
                    }}>
                      {trip.name}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '60px 20px',
                color: 'var(--text-muted)',
                fontSize: '15px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px dashed var(--border-primary)'
              }}>
                No previous trips yet. Start planning your first adventure!
              </div>
            )}
          </div>
        </div>

        {/* Plan a trip button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '60px',
          marginBottom: '40px'
        }}>
          <button
            className="button"
            onClick={() => navigate('/trips/new')}
            style={{ 
              padding: '16px 32px', 
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--accent-blue)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(74, 158, 255, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(74, 158, 255, 0.4)';
              e.currentTarget.style.backgroundColor = '#3a8eef';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 158, 255, 0.3)';
              e.currentTarget.style.backgroundColor = 'var(--accent-blue)';
            }}
          >
            + Plan a New Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

