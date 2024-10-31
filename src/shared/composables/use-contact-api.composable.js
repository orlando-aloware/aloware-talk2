import axios from 'axios'

const useContactApi = () => {
  const getLastUsedCallLineByContactId = async (id) => {
    const { data } = await axios.get(`/api/v1/contacts/${id}/last-used-call-line`)

    return data
  }

  return {
    getLastUsedCallLineByContactId
  }
}

export default useContactApi
