import Foundation

enum Money {
    static func iqd(_ amount: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        let n = formatter.string(from: NSNumber(value: amount)) ?? "\(amount)"
        return "\(n) د.ع"
    }

    static func parse(_ raw: String) -> Int {
        let digits = raw.filter(\.isNumber)
        return Int(digits) ?? 0
    }
}

enum Dates {
    static func short(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_GB")
        f.dateStyle = .medium
        f.timeStyle = .none
        return f.string(from: date)
    }
}
