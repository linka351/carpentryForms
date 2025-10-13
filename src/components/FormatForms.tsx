import { useFormik } from "formik";

function FormatForms() {
  const formik = useFormik({
    initialValues: {
      length: 0,
      width: 0,
      margin: 0,
      kerf: 0,
    },
    onSubmit: () => {
      console.log(
        `Długość: ${formik.values.length}, Szerokość: ${formik.values.width}, Margines: ${formik.values.margin}, Kerf: ${formik.values.kerf}`
      );
    },
  });
  return (
    <>
      <p>Parametry Płyty</p>
      <form
        onSubmit={formik.handleSubmit}
        className="p-4 border rounded shadow-md"
      >
        <div className="mb-4">
          <label htmlFor="length">Długość</label>
          <input
            id="length"
            name="length"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.length}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="width">Szerokość</label>
          <input
            id="width"
            name="width"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.width}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="margin">Margines</label>
          <input
            id="margin"
            name="margin"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.margin}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="kerf">Kerf</label>
          <input
            id="kerf"
            name="kerf"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.kerf}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-black font-semibold rounded-md hover:bg-blue-700 mt-4"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

export default FormatForms;
