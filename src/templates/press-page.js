import React, { useEffect, useState } from "react"
import ClampLines from "react-clamp-lines"
import { Col, Row } from "reactstrap"
import PropTypes from "prop-types"
import { graphql } from "gatsby"

import { App, MiniLogoWall, KeepBlog, Link } from "../components"
import PageSection, { SeeAllButton } from "../components/PageSection"
import { sections } from "../constants"

const PressItem = ({ title, date, source, aboveTheFold, url }) => {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
  }, [])

  return (
    <div className="press-item">
      <div className="press-item-content">
        <div className="top">
          <h4 className="article-title">{title}</h4>
          <label className="source source-large">{source}</label>
          <div className="above-the-fold">
            <ClampLines
              text={aboveTheFold}
              lines={windowWidth < 767 ? 4 : 2}
              ellipsis="..."
              buttons={false}
            />
          </div>
          <div className="date">{date}</div>
        </div>
        <div className="view-post">
          <Link
            url={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-default"
          >
            Read Post
          </Link>
        </div>
      </div>
    </div>
  )
}

PressItem.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  source: PropTypes.string,
  aboveTheFold: PropTypes.string,
  url: PropTypes.string,
}

export const PressPageTemplate = ({
  hero,
  minilogo_grid: minilogoGrid,
  news: news,
  press_items_section: pressItemsSection,
}) => {
  const { press_items: pressItems } = pressItemsSection
  const [allPressEntries, setAllPressEntries] = useState([])
  const [pressEntries, setPressEntries] = useState([])

  useEffect(() => {
    const dateOptions = { year: "numeric", month: "long", day: "numeric" }
    const sortedAndFormatted = pressItems
      .slice()
      // Sort by latest item date
      .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
      .map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", dateOptions),
      }))
    setAllPressEntries(sortedAndFormatted)
    setPressEntries(sortedAndFormatted.slice(0, 10))
  }, [pressItems])

  const handleShowAll = () => {
    setPressEntries(allPressEntries)
  }

  return (
    <div className="press-content">
      <PageSection id={sections.press.HOME}>
        <div>
          <h1 className="h1-underline">{hero.title}</h1>
          <h3
            className="body"
            dangerouslySetInnerHTML={{ __html: hero.body }}
          />
        </div>
        {hero.cta_buttons.map((btn, i) => (
          <Link
            key={`cta-btn-${i}`}
            url={btn.url}
            className="cta-link btn btn-primary"
          >
            {btn.label}
          </Link>
        ))}
      </PageSection>
      <PageSection id={sections.press.MINILOGO_GRID}>
        <MiniLogoWall logos={minilogoGrid} />
      </PageSection>
      <PageSection id={sections.press.NEWS}>
        <KeepBlog {...news} />
      </PageSection>
      <PageSection id={sections.press.LATEST_POST}>
        <Row className="title-section">
          <Col xs={12} md={8}>
            <h3>{pressItemsSection.title}</h3>
          </Col>
          <Col className="year-filter" xs={12} md={4}>
            <Link className="year-filter-item">2019</Link>
            <Link className="year-filter-item">2020</Link>
            <Link className="year-filter-item">2021</Link>
          </Col>
        </Row>
        <Row className="press-items">
          <Col>
            {pressEntries.map((entry) => (
              <PressItem
                title={entry.title}
                date={entry.date}
                source={entry.source}
                aboveTheFold={entry.excerpt}
                url={entry.url}
                key={entry.url}
              />
            ))}
          </Col>
        </Row>
        {allPressEntries.length > 10 && pressEntries.length === 10 ? (
          <div className="pagination">
            <SeeAllButton onClick={handleShowAll} />
          </div>
        ) : (
          ""
        )}
      </PageSection>
    </div>
  )
}

PressPageTemplate.propTypes = {
  hero: PropTypes.object,
  minilogo_grid: PropTypes.array,
  news: PropTypes.object,
  press_items_section: PropTypes.object,
}

const PressPage = ({ data }) => {
  const { markdownRemark: post } = data
  return (
    <App>
      <PressPageTemplate {...post.frontmatter} />
    </App>
  )
}

PressPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.object,
  }),
}

export default PressPage

export const query = graphql`
  query PressPage($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      frontmatter {
        title
        hero {
          title
          body
          cta_buttons {
            label
            url
          }
        }
        minilogo_grid {
          icon {
            image {
              relativePath
            }
            alt
          }
        }
        news {
          title
          body
          cards {
            icon {
              image {
                relativePath
              }
              alt
            }
            title
            source
            excerpt
            date
            url
          }
        }
        press_items_section {
          title
          press_items {
            title
            date
            source
            excerpt
            url
          }
        }
      }
    }
  }
`
