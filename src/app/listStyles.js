export const tableHeaderGreen = "#E8F5E9";
export const tableBorderGreen = "#C8E6C9";

export const compactListSx = {
  width: "100%",
  "& .RaList-main": {
    maxWidth: "calc(100vw - 300px)",
    marginLeft: "auto",
    marginRight: "auto",
  },
  "& .RaList-content": {
    overflowX: "hidden",
    borderRadius: 3,
    boxShadow: 3,
    backgroundColor: "#ffffff",
    p: 2,
  },
  "& .RaDatagrid-root": {
    overflowX: "hidden",
    border: `1px solid ${tableBorderGreen}`,
    borderRadius: 3,
  },
  "& .RaDatagrid-table": {
    width: "100%",
    tableLayout: "fixed",
  },
  "& .RaDatagrid-table thead .MuiTableCell-root": {
    backgroundColor: tableHeaderGreen,
    fontWeight: "bold",
    lineHeight: 1.2,
    borderBottom: `1px solid ${tableBorderGreen}`,
  },
  "& .RaDatagrid-table thead .MuiTableCell-root:first-of-type": {
    borderTopLeftRadius: 12,
  },
  "& .RaDatagrid-table thead .MuiTableCell-root:last-of-type": {
    borderTopRightRadius: 12,
  },
  "& .MuiTableCell-root": {
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    paddingLeft: "10px",
    paddingRight: "10px",
    verticalAlign: "middle",
  },
  "& .MuiTableCell-head": {
    lineHeight: 1.2,
  },
  "& .MuiButton-root": {
    minWidth: 36,
  },
};

export const compactDatagridSx = {
  overflowX: "hidden",
  "& .RaDatagrid-table": {
    width: "100%",
    tableLayout: "fixed",
  },
  "& thead .MuiTableCell-root": {
    backgroundColor: tableHeaderGreen,
    fontWeight: "bold",
    lineHeight: 1.2,
    borderBottom: `1px solid ${tableBorderGreen}`,
  },
  "& thead .MuiTableCell-root:first-of-type": {
    borderTopLeftRadius: 12,
  },
  "& thead .MuiTableCell-root:last-of-type": {
    borderTopRightRadius: 12,
  },
  "& .MuiTableCell-root": {
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    paddingLeft: "10px",
    paddingRight: "10px",
    verticalAlign: "middle",
  },
  "& .MuiTableCell-head": {
    lineHeight: 1.2,
  },
};

export const centeredPageSx = {
  width: "100%",
  maxWidth: "calc(100vw - 300px)",
  marginLeft: "auto",
  marginRight: "auto",
};

export const compactTableContainerSx = {
  borderRadius: 3,
  overflowX: "hidden",
  border: `1px solid ${tableBorderGreen}`,
};

export const compactTableSx = {
  width: "100%",
  tableLayout: "fixed",
  "& .MuiTableCell-root": {
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    paddingLeft: "10px",
    paddingRight: "10px",
    verticalAlign: "middle",
  },
  "& .MuiTableCell-head": {
    backgroundColor: tableHeaderGreen,
    borderBottom: `1px solid ${tableBorderGreen}`,
    fontWeight: "bold",
    lineHeight: 1.2,
  },
  "& .MuiTableHead-root .MuiTableCell-root:first-of-type": {
    borderTopLeftRadius: 12,
  },
  "& .MuiTableHead-root .MuiTableCell-root:last-of-type": {
    borderTopRightRadius: 12,
  },
};
