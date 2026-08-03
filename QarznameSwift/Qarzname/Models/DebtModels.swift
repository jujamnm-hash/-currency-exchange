import Foundation
import SwiftData

@Model
final class Person {
    var id: UUID
    var name: String
    var phone: String
    var notes: String
    var createdAt: Date
    @Relationship(deleteRule: .cascade, inverse: \Debt.person)
    var debts: [Debt]

    init(name: String, phone: String = "", notes: String = "") {
        self.id = UUID()
        self.name = name
        self.phone = phone
        self.notes = notes
        self.createdAt = Date()
        self.debts = []
    }

    var owedToMe: Int {
        debts.filter { $0.type == .owedToMe && $0.remaining > 0 }.reduce(0) { $0 + $1.remaining }
    }

    var iOwe: Int {
        debts.filter { $0.type == .iOwe && $0.remaining > 0 }.reduce(0) { $0 + $1.remaining }
    }

    var net: Int { owedToMe - iOwe }
}

enum DebtType: String, Codable, CaseIterable {
    case owedToMe
    case iOwe

    var titleKU: String {
        switch self {
        case .owedToMe: return "قەرزی کەس لای من"
        case .iOwe: return "قەرزی من لای کەس"
        }
    }

    var shortKU: String {
        switch self {
        case .owedToMe: return "بۆ من"
        case .iOwe: return "لە من"
        }
    }
}

enum DebtStatus: String, Codable {
    case open
    case partial
    case paid

    var titleKU: String {
        switch self {
        case .open: return "کراوە"
        case .partial: return "بەشی پارەدراو"
        case .paid: return "تەواو"
        }
    }
}

@Model
final class Debt {
    var id: UUID
    var typeRaw: String
    var amount: Int
    var remaining: Int
    var debtDescription: String
    var date: Date
    var statusRaw: String
    var createdAt: Date
    var person: Person?
    @Relationship(deleteRule: .cascade, inverse: \Payment.debt)
    var payments: [Payment]

    var type: DebtType {
        get { DebtType(rawValue: typeRaw) ?? .owedToMe }
        set { typeRaw = newValue.rawValue }
    }

    var status: DebtStatus {
        get { DebtStatus(rawValue: statusRaw) ?? .open }
        set { statusRaw = newValue.rawValue }
    }

    init(
        person: Person,
        type: DebtType,
        amount: Int,
        description: String = "",
        date: Date = Date()
    ) {
        self.id = UUID()
        self.typeRaw = type.rawValue
        self.amount = amount
        self.remaining = amount
        self.debtDescription = description
        self.date = date
        self.statusRaw = DebtStatus.open.rawValue
        self.createdAt = Date()
        self.person = person
        self.payments = []
    }

    func applyPayment(amount: Int, note: String = "", date: Date = Date()) -> Payment? {
        let value = min(max(amount, 0), remaining)
        guard value > 0 else { return nil }
        remaining -= value
        status = remaining == 0 ? .paid : .partial
        let payment = Payment(debt: self, amount: value, note: note, date: date)
        payments.append(payment)
        return payment
    }
}

@Model
final class Payment {
    var id: UUID
    var amount: Int
    var note: String
    var date: Date
    var createdAt: Date
    var debt: Debt?

    init(debt: Debt, amount: Int, note: String = "", date: Date = Date()) {
        self.id = UUID()
        self.amount = amount
        self.note = note
        self.date = date
        self.createdAt = Date()
        self.debt = debt
    }
}
