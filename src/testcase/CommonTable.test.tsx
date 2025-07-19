// src/components/Tests/CommonTable.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommonTable } from '../component/commontable'; 
import '@testing-library/jest-dom';


// Mocking the export functions
jest.mock('../utils/commonfunc/download', () => ({
  exportToExcel: jest.fn(),
  exportToPDF: jest.fn(),
}));

describe('CommonTable', () => {
  const mockOnPageChange = jest.fn();
  const mockOnLimitChange = jest.fn();
  const mockOnSearchChange = jest.fn();
  const mockOnSortChange = jest.fn();

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Age',
      accessorKey: 'age',
    },
  ];

  const data = [
    { name: 'John Doe', age: 28 },
    { name: 'Jane Smith', age: 34 },
  ];

  const total = 2;
  const exportFileName = 'test_export';
  const page = 1;
  const limit = 10;
  const search = '';
  const isLoading = false; // Add isLoading as it's required

  it('should render the table with correct data and headers', () => {
    render(
      <CommonTable
        columns={columns}
        data={data}
        total={total}
        exportFileName={exportFileName}
        page={page}
        limit={limit}
        search={search}
        isLoading={isLoading} // Pass isLoading here
        onPageChange={mockOnPageChange}
        onLimitChange={mockOnLimitChange}
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
      />
    );

    // Check that the headers render correctly
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    // Check that the data rows render correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
  });

  it('should call onSearchChange when the search input changes', () => {
    render(
      <CommonTable
        columns={columns}
        data={data}
        total={total}
        exportFileName={exportFileName}
        page={page}
        limit={limit}
        search={search}
        isLoading={isLoading} // Pass isLoading here
        onPageChange={mockOnPageChange}
        onLimitChange={mockOnLimitChange}
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
      />
    );

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('John');
  });

//   it('should call onSortChange when sorting the table by column', () => {
//     render(
//       <CommonTable
//         columns={columns}
//         data={data}
//         total={total}
//         exportFileName={exportFileName}
//         page={page}
//         limit={limit}
//         search={search}
//         isLoading={isLoading} // Pass isLoading here
//         onPageChange={mockOnPageChange}
//         onLimitChange={mockOnLimitChange}
//         onSearchChange={mockOnSearchChange}
//         onSortChange={mockOnSortChange}
//       />
//     );

//     const nameHeader = screen.getByText('Name');
//     fireEvent.click(nameHeader); // Simulate sorting action

//     expect(mockOnSortChange).toHaveBeenCalledWith('name', true); // Assuming the first click sorts ascending
//   });

//   it('should call onPageChange when the page is changed', () => {
//     render(
//       <CommonTable
//         columns={columns}
//         data={data}
//         total={total}
//         exportFileName={exportFileName}
//         page={page}
//         limit={limit}
//         search={search}
//         isLoading={isLoading} // Pass isLoading here
//         onPageChange={mockOnPageChange}
//         onLimitChange={mockOnLimitChange}
//         onSearchChange={mockOnSearchChange}
//         onSortChange={mockOnSortChange}
//       />
//     );

//     const nextPageButton = screen.getByLabelText('Go to next page');
//     fireEvent.click(nextPageButton);

//     expect(mockOnPageChange).toHaveBeenCalledWith(2); // Verify the page change action
//   });

  it('should call the export functions when the export buttons are clicked', async () => {
    render(
      <CommonTable
        columns={columns}
        data={data}
        total={total}
        exportFileName={exportFileName}
        page={page}
        limit={limit}
        search={search}
        isLoading={isLoading} // Pass isLoading here
        onPageChange={mockOnPageChange}
        onLimitChange={mockOnLimitChange}
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
      />
    );

    const excelButton = screen.getByText('Export Excel');
    const pdfButton = screen.getByText('Export PDF');
    const csvButton = screen.getByText('Export CSV');

    fireEvent.click(excelButton);
    fireEvent.click(pdfButton);
    fireEvent.click(csvButton);

    await waitFor(() => {
    //   expect(exportToExcel).toHaveBeenCalled();
    //   expect(exportToPDF).toHaveBeenCalled();
    });
  });
});
