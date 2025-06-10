import Database from '../services/database.services'
export class SlotRepository {
  async createSlot(slotData: any) {
    console.log('CreateSlot Repository')
    let newSlotId = 'S001'
    const lastId = `
   SELECT TOP 1 Slot_ID
      FROM Slot
      ORDER BY CAST(SUBSTRING(Slot_ID, 2, LEN(Slot_ID) - 1) AS INT) DESC`

    const lastIdResult = await Database.query(lastId)
    if (lastIdResult.length > 0) {
      const lastSlotId = lastIdResult[0].Slot_ID // ex: 'S005'
      const numericPart = parseInt(lastSlotId.slice(1)) // => 5
      const nextId = numericPart + 1
      newSlotId = 'S' + String(nextId).padStart(3, '0') // => 'S006'
    }

    try {
      const { ...fields } = slotData
      const insertQuery = `INSERT INTO Slot( Slot_ID, Slot_Date,Start_Time, Volume, Max_Volume,End_Time, Status, User_ID
                ) Values(?,?,?,?,?,?,?,?)`
      const params = [
        newSlotId,
        fields.Slot_Date,
        fields.Start_Time,
        fields.Volume,
        fields.Max_Volume,
        fields.End_Time,
        fields.Status,
        fields.User_ID
      ]
      const result = await Database.queryParam(insertQuery, params)
      console.log('Repository', result)

      return result
    } catch (error) {
      throw error
    }
  }
}
