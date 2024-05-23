import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Pagination, Form, Button } from 'react-bootstrap';


const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedBook, setEditedBook] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://openlibrary.org/subjects/science_fiction.json?limit=${perPage}&offset=${(page - 1) * perPage}&author=${searchQuery}`
        );
        const booksData = response.data.works;

        const booksWithAuthors = await Promise.all(
          booksData.map(async (book) => {
            const authorKey = book.authors[0]?.key;
            if (!authorKey) {
              return {
                ...book,
                ratings_average: book.ratings_average || 'N/A',
                author_name: 'Unknown',
                author_birth_date: 'Unknown',
                author_top_work: 'Unknown',
                subject: book.subject ? book.subject.slice(0, 3) : [], // Display only top 3 subjects
              };
            }
            const authorResponse = await axios.get(`https://openlibrary.org${authorKey}.json`);
            const authorData = authorResponse.data;

            return {
              ...book,
              ratings_average: book.ratings_average || 'N/A',
              author_name: authorData.name,
              author_birth_date: authorData.birth_date,
              author_top_work: authorData.top_work,
              subject: book.subject ? book.subject.slice(0, 3) : [], // Display only top 3 subjects
            };
          })
        );

        setBooks(booksWithAuthors);
        setTotalBooks(response.data.work_count);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, perPage, searchQuery]);

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value));
    setPage(1); // Reset to the first page whenever perPage changes
  };

  const handleEdit = (index) => {
    setEditRowIndex(index);
    setEditedBook(books[index]);
  };

  const handleSave = () => {
    const updatedBooks = [...books];
    updatedBooks[editRowIndex] = editedBook;
    setBooks(updatedBooks);
    setEditRowIndex(null);
    setEditedBook({});
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedBook({ ...editedBook, [name]: value });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const totalPages = Math.ceil(totalBooks / perPage);

  const renderPaginationItems = () => {
    let items = [];
    const visiblePages = 5; // Number of pagination buttons to show
    const startPage = Math.max(1, page - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
          {number}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <Container>
      <h1>Admin Dashboard</h1>
      <Form.Group controlId="perPageSelect" className="mb-3">
        <Form.Label>Records per page:</Form.Label>
        <Form.Control as="select" value={perPage} onChange={handlePerPageChange}>
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="searchInput" className="mb-3">
        <Form.Label>Search by Author:</Form.Label>
        <Form.Control type="text" placeholder="Enter author name" value={searchQuery} onChange={handleSearch} />
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Ratings Average</th>
            <th>Author Name</th>
            <th>Title</th>
            <th>First Publish Year</th>
            <th>Subject</th>
            <th>Author Birth Date</th>
            <th>Author Top Work</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={index}>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                    type="text"
                    name="ratings_average"
                    value={editedBook.ratings_average}
                    onChange={handleInputChange}
                  />
                ) : (
                  book.ratings_average
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                    type="text"
                    name="author_name"
                    value={editedBook.author_name}
                    onChange={handleInputChange}
                  />
                ) : (
                  book.author_name
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                    type="text"
                    name="title"
                    value={editedBook.title}
                    onChange={handleInputChange}
                  />
                ) : (
                  book.title
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                    type="text"
                    name="first_publish_year"
                    value={editedBook.first_publish_year}
                    onChange={handleInputChange}
                  />
                ) : (
                  book.first_publish_year
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                    type="text"
                    name="subject"
                    value={editedBook.subject.join(', ')}
                    onChange={handleInputChange}
                  />
                ) : (
                  book.subject.join(', ')
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                    type="text"
                    name="author_birth_date"
                    value={editedBook.author_birth_date}
                    onChange={handleInputChange}
                  />
                ) : (
                  book.author_birth_date
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <Form.Control
                  type="text"
                  name="author_top_work"
                  value={editedBook.author_top_work}
                  onChange={handleInputChange}
                />
              ) : (
                book.author_top_work
              )}
            </td>
            <td>
              {editRowIndex === index ? (
                <Button variant="success" onClick={handleSave}>
                  Save
                </Button>
              ) : (
                <Button variant="primary" onClick={() => handleEdit(index)}>
                  Edit
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    <Pagination>
      <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
      <Pagination.Prev onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} />
      {renderPaginationItems()}
      <Pagination.Next onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages} />
      <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
    </Pagination>
  </Container>
);
};

export default AdminDashboard;

